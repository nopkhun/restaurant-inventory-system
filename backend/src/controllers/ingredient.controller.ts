import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Ingredient, { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from '../models/Ingredient';
import Supplier from '../models/Supplier';
import { TokenPayload } from '../utils/auth';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Get all ingredients with search and filtering
export const getIngredients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      unit,
      is_active = 'true',
      page = 1,
      limit = 20
    } = req.query as any;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const whereConditions: any = {};

    if (is_active !== 'all') {
      whereConditions.is_active = is_active === 'true';
    }

    if (category) {
      whereConditions.category = category;
    }

    if (unit) {
      whereConditions.unit = unit;
    }

    if (search) {
      whereConditions[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: ingredients } = await Ingredient.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['name', 'ASC']],
      limit: limitNum,
      offset: offset
    });

    res.json({
      success: true,
      data: {
        ingredients,
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total: count,
          total_pages: Math.ceil(count / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Get single ingredient by ID
export const getIngredient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'contact_person', 'phone', 'email'],
          required: false
        }
      ]
    });

    if (!ingredient) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INGREDIENT_NOT_FOUND',
          message: 'ไม่พบวัตถุดิบที่ระบุ'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: { ingredient }
    });
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Create new ingredient
export const createIngredient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      code,
      name,
      category,
      unit,
      cost_per_unit,
      supplier_id,
      min_stock_level,
      shelf_life_days
    } = req.body;

    // Check if ingredient code already exists
    const existingIngredient = await Ingredient.findOne({ where: { code } });
    if (existingIngredient) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'รหัสวัตถุดิบนี้มีอยู่ในระบบแล้ว'
        }
      });
      return;
    }

    // Verify supplier exists if provided
    if (supplier_id) {
      const supplier = await Supplier.findByPk(supplier_id);
      if (!supplier) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SUPPLIER_NOT_FOUND',
            message: 'ไม่พบซัพพลายเออร์ที่ระบุ'
          }
        });
        return;
      }
    }

    const ingredient = await Ingredient.create({
      code,
      name,
      category,
      unit,
      cost_per_unit,
      supplier_id,
      min_stock_level,
      shelf_life_days
    });

    // Fetch the created ingredient with supplier info
    const createdIngredient = await Ingredient.findByPk(ingredient.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: { ingredient: createdIngredient },
      message: 'สร้างวัตถุดิบใหม่เรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Update ingredient
export const updateIngredient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INGREDIENT_NOT_FOUND',
          message: 'ไม่พบวัตถุดิบที่ระบุ'
        }
      });
      return;
    }

    // Check if code is being updated and if it already exists
    if (updateData.code && updateData.code !== ingredient.code) {
      const existingIngredient = await Ingredient.findOne({ 
        where: { 
          code: updateData.code,
          id: { [Op.ne]: id }
        } 
      });
      if (existingIngredient) {
        res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'รหัสวัตถุดิบนี้มีอยู่ในระบบแล้ว'
          }
        });
        return;
      }
    }

    // Verify supplier exists if provided
    if (updateData.supplier_id) {
      const supplier = await Supplier.findByPk(updateData.supplier_id);
      if (!supplier) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SUPPLIER_NOT_FOUND',
            message: 'ไม่พบซัพพลายเออร์ที่ระบุ'
          }
        });
        return;
      }
    }

    await ingredient.update(updateData);

    // Fetch updated ingredient with supplier info
    const updatedIngredient = await Ingredient.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: { ingredient: updatedIngredient },
      message: 'อัปเดตข้อมูลวัตถุดิบเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Deactivate ingredient (soft delete)
export const deactivateIngredient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INGREDIENT_NOT_FOUND',
          message: 'ไม่พบวัตถุดิบที่ระบุ'
        }
      });
      return;
    }

    // Check if ingredient has stock in any location
    // This would require checking the inventory table, but for now we'll just deactivate
    await ingredient.update({ is_active: false });

    res.json({
      success: true,
      message: 'ปิดการใช้งานวัตถุดิบเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error deactivating ingredient:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Reactivate ingredient
export const reactivateIngredient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INGREDIENT_NOT_FOUND',
          message: 'ไม่พบวัตถุดิบที่ระบุ'
        }
      });
      return;
    }

    await ingredient.update({ is_active: true });

    res.json({
      success: true,
      message: 'เปิดการใช้งานวัตถุดิบเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error reactivating ingredient:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Get ingredient categories
export const getIngredientCategories = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: { categories: INGREDIENT_CATEGORIES }
    });
  } catch (error) {
    console.error('Error fetching ingredient categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Get ingredient units
export const getIngredientUnits = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: { units: INGREDIENT_UNITS }
    });
  } catch (error) {
    console.error('Error fetching ingredient units:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Bulk import ingredients
export const bulkImportIngredients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { ingredients } = req.body;
    const results: {
      success: Array<{ row: number; code: string; name: string }>;
      errors: Array<{ row: number; code: string; error: string }>;
      total: number;
    } = {
      success: [],
      errors: [],
      total: ingredients.length
    };

    for (let i = 0; i < ingredients.length; i++) {
      const ingredientData = ingredients[i];
      
      try {
        // Check if ingredient code already exists
        const existingIngredient = await Ingredient.findOne({ 
          where: { code: ingredientData.code } 
        });
        
        if (existingIngredient) {
          results.errors.push({
            row: i + 1,
            code: ingredientData.code,
            error: 'รหัสวัตถุดิบนี้มีอยู่ในระบบแล้ว'
          });
          continue;
        }

        // Verify supplier exists if provided
        if (ingredientData.supplier_id) {
          const supplier = await Supplier.findByPk(ingredientData.supplier_id);
          if (!supplier) {
            results.errors.push({
              row: i + 1,
              code: ingredientData.code,
              error: 'ไม่พบซัพพลายเออร์ที่ระบุ'
            });
            continue;
          }
        }

        const ingredient = await Ingredient.create(ingredientData);
        results.success.push({
          row: i + 1,
          code: ingredient.code,
          name: ingredient.name
        });
      } catch (error) {
        results.errors.push({
          row: i + 1,
          code: ingredientData.code,
          error: 'เกิดข้อผิดพลาดในการสร้างวัตถุดิบ'
        });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `นำเข้าข้อมูลเสร็จสิ้น: สำเร็จ ${results.success.length} รายการ, ผิดพลาด ${results.errors.length} รายการ`
    });
  } catch (error) {
    console.error('Error bulk importing ingredients:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};

// Export ingredients to CSV format
export const exportIngredients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { format = 'json' } = req.query;

    const ingredients = await Ingredient.findAll({
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['name'],
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    if (format === 'csv') {
      // Generate CSV format
      const csvHeader = 'รหัส,ชื่อ,หมวดหมู่,หน่วย,ราคาต่อหน่วย,ซัพพลายเออร์,จุดสั่งซื้อ,อายุการเก็บ,สถานะ\n';
      const csvData = ingredients.map(ingredient => {
        const supplierName = (ingredient as any).supplier?.name || '';
        return [
          ingredient.code,
          ingredient.name,
          ingredient.category,
          ingredient.unit,
          ingredient.cost_per_unit,
          supplierName,
          ingredient.min_stock_level,
          ingredient.shelf_life_days || '',
          ingredient.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="ingredients.csv"');
      res.send('\ufeff' + csvHeader + csvData); // Add BOM for UTF-8
    } else {
      res.json({
        success: true,
        data: { ingredients }
      });
    }
  } catch (error) {
    console.error('Error exporting ingredients:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    });
  }
};