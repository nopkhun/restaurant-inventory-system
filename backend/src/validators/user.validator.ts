import Joi from 'joi';
import { UserRole } from '../models/User';

export const createUserSchema = Joi.object({
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

export const updateUserSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .optional()
    .messages({
      'string.alphanum': 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรและตัวเลขเท่านั้น',
      'string.min': 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร',
      'string.max': 'ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 50 ตัวอักษร'
    }),
  email: Joi.string()
    .email()
    .max(100)
    .optional()
    .messages({
      'string.email': 'รูปแบบอีเมลไม่ถูกต้อง',
      'string.max': 'อีเมลต้องมีความยาวไม่เกิน 100 ตัวอักษร'
    }),
  firstName: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'กรุณากรอกชื่อ',
      'string.max': 'ชื่อต้องมีความยาวไม่เกิน 50 ตัวอักษร'
    }),
  lastName: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'กรุณากรอกนามสกุล',
      'string.max': 'นามสกุลต้องมีความยาวไม่เกิน 50 ตัวอักษร'
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional()
    .messages({
      'any.only': 'บทบาทไม่ถูกต้อง'
    }),
  locationId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.uuid': 'รหัสสาขาไม่ถูกต้อง'
    })
});

export const resetPasswordSchema = Joi.object({
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

export const getUsersQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.integer': 'หน้าต้องเป็นจำนวนเต็ม',
      'number.min': 'หน้าต้องมากกว่าหรือเท่ากับ 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.integer': 'จำนวนรายการต่อหน้าต้องเป็นจำนวนเต็ม',
      'number.min': 'จำนวนรายการต่อหน้าต้องมากกว่าหรือเท่ากับ 1',
      'number.max': 'จำนวนรายการต่อหน้าต้องไม่เกิน 100'
    }),
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'คำค้นหาต้องมีความยาวไม่เกิน 100 ตัวอักษร'
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional()
    .messages({
      'any.only': 'บทบาทไม่ถูกต้อง'
    }),
  locationId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.uuid': 'รหัสสาขาไม่ถูกต้อง'
    }),
  isActive: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'สถานะการใช้งานต้องเป็น true หรือ false'
    })
});

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const dataToValidate = req.method === 'GET' ? req.query : req.body;
    const { error, value } = schema.validate(dataToValidate, { abortEarly: false });
    
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

    // For GET requests, update req.query with validated values
    if (req.method === 'GET') {
      req.query = value;
    }

    next();
  };
};