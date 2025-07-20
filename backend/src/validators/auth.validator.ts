import Joi from 'joi';
import { UserRole } from '../models/User';

export const loginSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรและตัวเลขเท่านั้น',
      'string.min': 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร',
      'string.max': 'ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 50 ตัวอักษร',
      'any.required': 'กรุณากรอกชื่อผู้ใช้'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
      'any.required': 'กรุณากรอกรหัสผ่าน'
    })
});

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรและตัวเลขเท่านั้น',
      'string.min': 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร',
      'string.max': 'ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 50 ตัวอักษร',
      'any.required': 'กรุณากรอกชื่อผู้ใช้'
    }),
  email: Joi.string()
    .email()
    .max(100)
    .required()
    .messages({
      'string.email': 'รูปแบบอีเมลไม่ถูกต้อง',
      'string.max': 'อีเมลต้องมีความยาวไม่เกิน 100 ตัวอักษร',
      'any.required': 'กรุณากรอกอีเมล'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
      'string.pattern.base': 'รหัสผ่านต้องประกอบด้วยตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข',
      'any.required': 'กรุณากรอกรหัสผ่าน'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'รหัสผ่านยืนยันไม่ตรงกัน',
      'any.required': 'กรุณายืนยันรหัสผ่าน'
    }),
  firstName: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'กรุณากรอกชื่อ',
      'string.max': 'ชื่อต้องมีความยาวไม่เกิน 50 ตัวอักษร',
      'any.required': 'กรุณากรอกชื่อ'
    }),
  lastName: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'กรุณากรอกนามสกุล',
      'string.max': 'นามสกุลต้องมีความยาวไม่เกิน 50 ตัวอักษร',
      'any.required': 'กรุณากรอกนามสกุล'
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      'any.only': 'บทบาทไม่ถูกต้อง',
      'any.required': 'กรุณาเลือกบทบาท'
    }),
  locationId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.uuid': 'รหัสสาขาไม่ถูกต้อง'
    })
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'กรุณาระบุ refresh token'
    })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'กรุณากรอกรหัสผ่านปัจจุบัน'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
      'string.pattern.base': 'รหัสผ่านใหม่ต้องประกอบด้วยตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข',
      'any.required': 'กรุณากรอกรหัสผ่านใหม่'
    }),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'รหัสผ่านใหม่ยืนยันไม่ตรงกัน',
      'any.required': 'กรุณายืนยันรหัสผ่านใหม่'
    })
});

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ข้อมูลไม่ถูกต้อง',
          details
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};