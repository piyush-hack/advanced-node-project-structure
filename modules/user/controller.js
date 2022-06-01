const Razorpay = require('razorpay');

const Model = require('./model');
const RoleModel = require('../role/model');
var encryption = require('../../utils/encryption');
const response = require('../../utils/response');
const Handlebars = require('handlebars');
const fs = require('fs');
const messages = require('../../utils/messages')['user'];
const pagination = require('../../config')['pagination'];
const common = require('../../utils/common');
const { sendMailgun } = require('../../utils/mailgunMail');
const mongoose = require('mongoose');
const { user } = require('../../utils/messages');

class UserController {
	async signUp(data, res) {
		try {
			const requiredFields = ['password', 'email', 'name'];
			if (!common.checkKeys(data.body, requiredFields)) {
				return response.sendBadRequest(res);
			}
			let user;
			const { name, phoneNumber, email } = data.body;
			let { password } = data.body;

			user = await Model.findOne({ email });

			if (user) {
				return response.sendError(res, messages.user_exist);
			}

			let role = await RoleModel.findOne({
				name: 'admin',
			});

			role = role._id;

			password = await encryption.hashPasswordUsingBcrypt(password);

			let verificationKey = new mongoose.Types.ObjectId();

			user = await Model.create({
				name,
				phoneNumber,
				email,
				password,
				role,
				// verificationKey,
			});

			let mailData = {
				VerificationLink: `${data.hostUrl}?id=${verificationKey}`,
				email: user.email,
			};

			let source = await fs
				.readFileSync('mailhtml/signupMail.html', 'utf8')
				.toString();

			let template = Handlebars.compile(source);

			var output = template(mailData);

			sendMailgun({
				to: email,
				subject: 'Verify your Account',
				html: output,
				inline: ['mailhtml/hexabull-logo.png', 'mailhtml/email-icon.png'],
				company: 'cbbc',
			});

			return response.sendSuccess(res, messages.user_added);
		} catch (error) {
			console.log(error)
			return response.sendSystemError(res, error);
		}
	}


	async resendVerification(data, res) {
		try {
			const { email } = data.body;

			let user = await Model.findOne({ email });

			if (!user) {
				return response.sendError(res, messages.not_found);
			}

			let verificationKey = new mongoose.Types.ObjectId();
			user.verificationKey = verificationKey;

			await user.save();

			let mailData = {
				VerificationLink: `${data.hostUrl}/api/user/verify/${verificationKey}`,
				email: user.email,
			};

			let source = await fs
				.readFileSync('mailhtml/signupMail.html', 'utf8')
				.toString();

			let template = Handlebars.compile(source);

			var output = template(mailData);

			sendMailgun({
				to: email,
				subject: 'Verify your Account',
				// text: `
				// Please use this link to verify your Account
				// ${data.hostUrl}/api/user/verify/${verificationKey}
				// `,
				html: output,
				inline: ['mailhtml/hexabull-logo.png', 'mailhtml/email-icon.png'],
				company: 'HexaBull',
			});

			return response.sendSuccess(res, messages.user_added);
		} catch (error) {
			return response.sendSystemError(res, error);
		}
	}

	async verify(data, res) {
		try {
			let user = await Model.findOne({
				verificationKey: data.params.verificationKey,
			});

			user.isVerified = true;
			user.verificationKey = null;

			await user.save();

			return response.sendSuccess(res, messages.user_verified);
		} catch (err) {
			return response.sendSystemError(res, err);
		}
	}

	async forgotPassword(data, res) {
		try {
			const requiredFields = ['email'];
			if (!common.checkKeys(data.body, requiredFields)) {
				return response.sendBadRequest(res);
			}

			let user;
			const { email } = data.body;

			user = await Model.findOne({ email: email, isHexanomyUser: false });

			if (!user) {
				return response.sendError(res, messages.not_found);
			}

			let verificationKey = new mongoose.Types.ObjectId();

			let mailData = {
				resetPasswordLink: `https://hexabull.com/forgot-password/${verificationKey}`,
				email: user.email,
			};

			let source = await fs
				.readFileSync('mailhtml/reset-password.html', 'utf8')
				.toString();

			let template = Handlebars.compile(source);

			var output = template(mailData);

			sendMailgun({
				to: email,
				subject: 'Reset Password',
				// text: `
				// Please use this link to verify your Account
				// ${data.hostUrl}/api/user/verify/${verificationKey}
				// `,
				html: output,
				inline: ['mailhtml/hexabull-logo.png', 'mailhtml/email-icon.png'],
				company: 'HexaBull',
			});

			user.verificationKey = verificationKey;
			await user.save();
			return response.sendSuccess(res, messages.sent_reset, {
				email: user.email,
				key: verificationKey,
			});
		} catch (err) {
			//console.log(err);
			return response.sendSystemError(res, err);
		}
	}

	async changePassword(data, res) {
		try {
			let requiredFields = ['_id'];
			if (!common.checkKeys(data.params, requiredFields)) {
				return response.sendBadRequest(res);
			}

			requiredFields = ['password'];
			if (!common.checkKeys(data.body, requiredFields)) {
				return response.sendBadRequest(res);
			}

			let { _id } = data.params;
			let { password } = data.body;

			let user = await Model.findOne({
				verificationKey: _id,
			});

			if (!user) {
				return response.sendError(res, messages.not_found);
			}

			password = await encryption.hashPasswordUsingBcrypt(password);

			user.password = password;
			user.verificationKey = null;
			await user.save();

			return response.sendSuccess(res, messages.reset_success);
		} catch (err) {
			//console.log(err);
			return response.sendSystemError(res, err);
		}
	}

	async login(data, res) {
		try {
			const requiredFields = ['email', 'password'];
			if (!common.checkKeys(data.body, requiredFields)) {
				return response.sendBadRequest(res);
			}

			let user;
			const { email, password } = data.body;

			user = await Model.findOne({
				email,
				isHexanomyUser: { $ne: true },
			}).populate('role');

			if (!user) {
				return response.sendError(res, messages.not_found);
			}

			// if (!user.isVerified) {
			// 	return response.sendError(res, messages.not_verfied);
			// }

			if (
				await encryption.comparePasswordUsingBcrypt(password, user.password)
			) {
				const criteriaForJWT = {
					_id: user._id,
					date: new Date(),
				};
				const token = await encryption.generateAuthToken(criteriaForJWT);
				res.cookie('Authorization', token, {});

				await Model.findOne({ email }).populate('role');
				return response.sendSuccess(res, messages.login_success, {
					token: token,
					user: user.email,
				});
			} else {
				return response.sendError(res, messages.login_failed);
			}
		} catch (err) {
			return response.sendSystemError(res, err);
		}
	}

	async profile(data, res) {
		try {
			let record = await Model.findById(data.user._id)
				.select('-password')
				.populate([
					{
						path: 'role',
						select: 'name',
					}
				])
				.lean(true);
			return response.sendSuccess(res, messages.profile, record);
		} catch (err) {
			return response.sendSystemError(res, err);
		}
	}

	async getUsers(data, res) {
		let records, meta;
		try {
			if (data.params._id) {
				if (data.user.role.name == 'admin') {
					records = await Model.findOne(data.params)
						.select({ password: 0 });
				} else {
					records = await Model.findOne(data.params).select({ password: 0 });
				}
				if (!records) {
					return response.sendError(res, messages.user.no_user_found);
				}
			} else {
				let skip = 0;
				let page = parseInt(data.query.page) || 1;
				let limit = parseInt(data.query.limit) || pagination.size;
				skip = (page - 1) * limit;
				delete data.query.page;
				delete data.query.limit;
				let sortBy = data.query.sortBy || '-_id';
				delete data.query.sortBy;

				records = await Model.find(data.query)
					.select({
						password: 0,
					})
					.sort(sortBy)
					.skip(skip)
					.limit(limit);
				if (page == 1) {
					meta = {
						currentPage: page,
						recordsPerPage: limit,
						totalRecords: await Model.find(data.query).count(),
					};
					meta.totalPages = Math.ceil(meta.totalRecords / meta.recordsPerPage);
				}
			}
			return response.sendSuccess(res, messages.user_fetch, records, meta);
		} catch (err) {
			return response.sendSystemError(res, err);
		}
	}

	async edit(data, res) {
		try {
			let body = data.body;
			delete body.password;
			delete body.role;

			let user = await Model.findOneAndUpdate(
				{
					_id: data.params._id,
				},
				{
					$set: body,
				},
				{
					new: true,
				}
			).select('-password -role');

			return response.sendSuccess(res, messages.edited, user);
		} catch (err) {
			return response.sendSystemError(res, err);
		}
	}

}

module.exports = new UserController();
