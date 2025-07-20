import Joi from 'joi';
import { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from '../models/Ingredient';

export const createIngredientSchema = Joi.object({
  code: Joi.string()
    .min(1)
    .max(20)
    .pattern(/^[A-Z0-9_-]+$/)
    .required()
    .messages({
      'string.min': 'รหัสวัตถุดิบต้องมีความยาวอย่างน้อย 1 ตัวอักษร',
      'string.max': 'รหัสวัตถุดิบต้องมีความยาวไม่เกิน 20 ตัวอักษร',
      'string.pattern.base': 'รหัสวัตถุดิบต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ ตัวเลข และเครื่องหมาย _ - เท่านั้น',
      'any.required': 'รหัสวัตถุดิบจำเป็นต้องระบุ'
    }),
  
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'ชื่อวัตถุดิบต้องมีความยาวอย่างน้อย 1 ตัวอักษร',
      'string.max': 'ชื่อวัตถุดิบต้องมีความยาวไม่เกิน 100 ตัวอักษร',
      'any.required': 'ชื่อวัตถุดิบจำเป็นต้องระบุ'
    }),
  
  category: Joi.string()
    .valid(...INGREDIENT_CATEGORIES)
    .required()
    .messages({
      'any.only': `หมวดหมู่วัตถุดิบต้องเป็นหนึ่งใน: ${INGREDIENT_CATEGORIES.join(', ')}`,
      'any.required': 'หมวดหมู่วัตถุดิบจำเป็นต้องระบุ'
    }),
  
  unit: Joi.string()
    .valid(...INGREDIENT_UNITS)
    .required()
    .messages({
      'any.only': `หน่วยนับต้องเป็นหนึ่งใน: ${INGREDIENT_UNITS.join(', ')}`,
      'any.required': 'หน่วยนับจำเป็นต้องระบุ'
    }),
  
  cost_per_unit: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'ราคาต่อหน่วยต้องมากกว่าหรือเท่ากับ 0',
      'any.required': 'ราคาต่อหน่วยจำเป็นต้องระบุ'
    }),
  
  supplier_id: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.uuid': 'รหัสซัพพลายเออร์ต้องเป็น UUID ที่ถูกต้อง'
    }),
  
  min_stock_level: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'จุดสั่งซื้อต้องมากกว่าหรือเท่ากับ 0',
      'any.required': 'จุดสั่งซื้อจำเป็นต้องระบุ'
    }),
  
  shelf_life_days: Joi.number()
    .integer()
    .min(1)
    .optional()
    .allow(null)
    .messages({
      'number.integer': 'อายุการเก็บรักษาต้องเป็นจำนวนเต็ม',
      'number.min': 'อายุการเก็บรักษาต้องมากกว่า 0'
    })
});

export const updateIngredientSchema = Joi.object({
  code: Joi.string()
    .min(1)
    .max(20)
    .pattern(/^[A-Z0-9_-]+$/)
    .optional()
    .messages({
      'string.min': 'รหัสวัตถุดิบต้องมีความยาวอย่างน้อย 1 ตัวอักษร',
      'string.max': 'รหัสวัตถุดิบต้องมีความยาวไม่เกิน 20 ตัวอักษร',
      'string.pattern.base': 'รหัสวัตถุดิบต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ ตัวเลข และเครื่องหมาย _ - เท่านั้น'
    }),
  
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'ชื่อวัตถุดิบต้องมีความยาวอย่างน้อย 1 ตัวอักษร',
      'string.max': 'ชื่อวัตถุดิบต้องมีความยาวไม่เกิน 100 ตัวอักษร'
    }),
  
  category: Joi.string()
    .valid(...INGREDIENT_CATEGORIES)
    .optional()
    .messages({
      'any.only': `หมวดหมู่วัตถุดิบต้องเป็นหนึ่งใน: ${INGREDIENT_CATEGORIES.join(', ')}`
    }),
  
  unit: Joi.string()
    .valid(...INGREDIENT_UNITS)
    .optional()
    .messages({
      'any.only': `หน่วยนับต้องเป็นหนึ่งใน: ${INGREDIENT_UNITS.join(', ')}`
    }),
  
  cost_per_unit: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'ราคาต่อหน่วยต้องมากกว่าหรือเท่ากับ 0'
    }),
  
  supplier_id: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.uuid': 'รหัสซัพพลายเออร์ต้องเป็น UUID ที่ถูกต้อง'
    }),
  
  min_stock_level: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'จุดสั่งซื้อต้องมากกว่าหรือเท่ากับ 0'
    }),
  
  shelf_life_days: Joi.number()
    .integer()
    .min(1)
    .optional()
    .allow(null)
    .messages({
      'number.integer': 'อายุการเก็บรักษาต้องเป็นจำนวนเต็ม',
      'number.min': 'อายุการเก็บรักษาต้องมากกว่า 0'
    })
});

export const getIngredientParamsSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'รหัสวัตถุดิบต้องเป็น UUID ที่ถูกต้อง',
      'any.required': 'รหัสวัตถุดิบจำเป็นต้องระบุ'
    })
});

export const searchIngredientsQuerySchema = Joi.object({
  search: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'คำค้นหาต้องมีความยาวอย่างน้อย 1 ตัวอักษร',
      'string.max': 'คำค้นหาต้องมีความยาวไม่เกิน 100 ตัวอักษร'
    }),
  
  category: Joi.string()
    .valid(...INGREDIENT_CATEGORIES)
    .optional()
    .messages({
      'any.only': `หมวดหมู่วัตถุดิบต้องเป็นหนึ่งใน: ${INGREDIENT_CATEGORIES.join(', ')}`
    }),
  
  unit: Joi.string()
    .valid(...INGREDIENT_UNITS)
    .optional()
    .messages({
      'any.only': `หน่วยนับต้องเป็นหนึ่งใน: ${INGREDIENT_UNITS.join(', ')}`
    }),
  
  is_active: Joi.string()
    .valid('true', 'false', 'all')
    .optional()
    .default('true')
    .messages({
      'any.only': 'สถานะการใช้งานต้องเป็น true, false หรือ all'
    }),
  
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
    .default(20)
    .messages({
      'number.integer': 'จำนวนรายการต่อหน้าต้องเป็นจำนวนเต็ม',
      'number.min': 'จำนวนรายการต่อหน้าต้องมากกว่าหรือเท่ากับ 1',
      'number.max': 'จำนวนรายการต่อหน้าต้องไม่เกิน 100'
    })
});

export const bulkImportSchema = Joi.object({
  ingredients: Joi.array()
    .items(
      Joi.object({
        code: Joi.string()
          .min(1)
          .max(20)
          .pattern(/^[A-Z0-9_-]+$/)
          .required()
          .messages({
            'string.min': 'รหัสวัตถุดิบต้องมีความยาวอย่างน้อย 1 ตัวอักษร',
            'string.max': 'รหัสวัตถุดิบต้องมีความยาวไม่เกิน 20 ตัวอักษร',
            'string.pattern.base': 'รหัสวัตถุดิบต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ ตัวเลข และเครื่องหมาย _ - เท่านั้น',
            'any.required': 'รหัสวัตถุดิบจำเป็นต้องระบุ'
          }),
        
        name: Joi.string()
          .min(1)
          .max(100)
          .required()
          .messages({
            'string.min': 'ชื่อวัตถุดิบต้องมีความยาวอย่างน้อย 1 ตัวอักษร',
            'string.max': 'ชื่อวัตถุดิบต้องมีความยาวไม่เกิน 100 ตัวอักษร',
            'any.required': 'ชื่อวัตถุดิบจำเป็นต้องระบุ'
          }),
        
        category: Joi.string()
          .valid(...INGREDIENT_CATEGORIES)
          .required()
          .messages({
            'any.only': `หมวดหมู่วัตถุดิบต้องเป็นหนึ่งใน: ${INGREDIENT_CATEGORIES.join(', ')}`,
            'any.required': 'หมวดหมู่วัตถุดิบจำเป็นต้องระบุ'
          }),
        
        unit: Joi.string()
          .valid(...INGREDIENT_UNITS)
          .required()
          .messages({
            'any.only': `หน่วยนับต้องเป็นหนึ่งใน: ${INGREDIENT_UNITS.join(', ')}`,
            'any.required': 'หน่วยนับจำเป็นต้องระบุ'
          }),
        
        cost_per_unit: Joi.number()
          .min(0)
          .required()
          .messages({
            'number.min': 'ราคาต่อหน่วยต้องมากกว่าหรือเท่ากับ 0',
            'any.required': 'ราคาต่อหน่วยจำเป็นต้องระบุ'
          }),
        
        supplier_id: Joi.string()
          .uuid()
          .optional()
          .allow(null)
          .messages({
            'string.uuid': 'รหัสซัพพลายเออร์ต้องเป็น UUID ที่ถูกต้อง'
          }),
        
        min_stock_level: Joi.number()
          .min(0)
          .required()
          .messages({
            'number.min': 'จุดสั่งซื้อต้องมากกว่าหรือเท่ากับ 0',
            'any.required': 'จุดสั่งซื้อจำเป็นต้องระบุ'
          }),
        
        shelf_life_days: Joi.number()
          .integer()
          .min(1)
          .optional()
          .allow(null)
          .messages({
            'number.integer': 'อายุการเก็บรักษาต้องเป็นจำนวนเต็ม',
            'number.min': 'อายุการเก็บรักษาต้องมากกว่า 0'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'ข้อมูลวัตถุดิบต้องมีอย่างน้อย 1 รายการ',
      'any.required': 'ข้อมูลวัตถุดิบจำเป็นต้องระบุ'
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

/**
 * Params validation middleware factory
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    
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

    req.params = value;
    next();
  };
};