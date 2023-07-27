const { Op } = require('sequelize');
const uuid = require('uuid');
const path = require('path');
const {
  Device,
  DeviceInfo,
  Type,
  Brand,
  OrderDevice,
  BasketDevice,
} = require('../models/models');
const ApiError = require('../error/ApiError');

class DeviceController {
  async create(req, res, next) {
    try {
      let { name, price, brandId, typeId, info, quantity } = req.body;
      const { img } = req.files;
      let fileName = uuid.v4() + '.jpg';
      img.mv(path.resolve(__dirname, '..', 'static', fileName));
      const device = await Device.create({
        name,
        price,
        brandId,
        typeId,
        img: fileName,
        quantity,
      });

      if (info) {
        info = JSON.parse(info);
        info.forEach(i => {
          DeviceInfo.create({
            title: i.title,
            description: i.description,
            deviceId: device.id,
          });
        });
      }

      return res.json(device);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getAll(req, res, next) {
    try {
      let { brandId, typeId, limit, page } = req.query;
      page = page || 1;
      limit = limit || 30;
      let offset = page * limit - limit;
      let devices;
      if (!brandId && !typeId) {
        devices = await Device.findAndCountAll({
          include: [{ model: Brand }, { model: Type }],
          limit,
          offset,
        });
      }
      if (brandId && !typeId) {
        devices = await Device.findAndCountAll({
          where: { brandId },
          include: [{ model: Brand }, { model: Type }],
          limit,
          offset,
        });
      }
      if (!brandId && typeId) {
        devices = await Device.findAndCountAll({
          where: { typeId },
          include: [{ model: Brand }, { model: Type }],
          limit,
          offset,
        });
      }
      if (brandId && typeId) {
        devices = await Device.findAndCountAll({
          where: { typeId, brandId },
          include: [{ model: Brand }, { model: Type }],
          limit,
          offset,
        });
      }
      return res.json(devices);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getSearchAllDeviceByNameBrandType(req, res, next) {
    try {
      let { limit, page, name, brand, type } = req.query;

      page = page || 1;
      limit = limit || 30;
      let offset = page * limit - limit;

      const where = {
        quantity: {
          [Op.gt]: 0, // Add this condition for quantity greater than 0
        },
      };
      if (name) {
        where.name = {
          [Op.iLike]: `%${name}%`,
        };
      }
      if (brand && brand !== 'All') {
        where.brandId = brand;
      }
      if (type && type !== 'All') {
        where.typeId = type;
      }
      const order = [];
      if (type && type !== 'All') {
        order.push(['name', 'ASC']);
      }
      if (brand && brand !== 'All') {
        order.push([Brand, 'name', 'ASC']);
      }

      const devices = await Device.findAndCountAll({
        where,
        include: [
          {
            model: Brand,
            attributes: ['id', 'name'],
          },
          {
            model: Type,
            attributes: ['id', 'name'],
          },
        ],
        order,
        limit,
        offset,
      });

      return res.json(devices);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getSearchAllDeviceByName(req, res, next) {
    try {
      let { limit, page, name, filter } = req.query;

      page = page || 1;
      limit = limit || 30;
      let offset = page * limit - limit;
      if (filter === 'All') {
        const devices = await Device.findAndCountAll({
          attributes: ['name', 'price', 'img', 'id', 'quantity'],
          where: {
            name: {
              [Op.like]: `%${name}%`,
            },
          },
          include: [
            {
              attributes: ['name'],
              model: Brand,
            },
            {
              attributes: ['name'],
              model: Type,
            },
          ],
          limit,
          offset,
        });

        return res.json(devices);
      } else {
        const devices = await Device.findAndCountAll({
          attributes: [
            'name',
            'price',
            'img',
            'id',
            'brandId',
            'typeId',
            'quantity',
          ],
          where: {
            name: {
              [Op.like]: `%${name}%`,
            },
            [Op.or]: [
              {
                brandId: null,
              },
              {
                typeId: null,
              },
            ],
          },
          include: [
            {
              attributes: ['name'],
              model: Brand,
            },
            {
              attributes: ['name'],
              model: Type,
            },
          ],
          limit,
          offset,
        });

        return res.json(devices);
      }
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      let devices = await Device.findOne({
        where: { id },
        include: [
          { model: DeviceInfo, as: 'info' },
          { model: Type },
          { model: Brand },
        ],
      });
      return res.json(devices);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await Device.findOne({ where: { id } }).then(async data => {
        if (data) {
          await Device.destroy({ where: { id } }).then(() => {
            return res.json('Device deleted');
          });
        } else {
          return res.json("This Device doesn't exist in DB");
        }

        await OrderDevice.destroy({ where: { deviceId: id } });
        await BasketDevice.destroy({ where: { deviceId: id } });
      });
    } catch (e) {
      return res.json(e);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { brandId, typeId, name, price, info, quantity } = req.body;

      await Device.findOne({ where: { id } }).then(async data => {
        if (data) {
          let newVal = {};
          brandId ? (newVal.brandId = brandId) : false;
          typeId ? (newVal.typeId = typeId) : false;
          name ? (newVal.name = name) : false;
          price ? (newVal.price = price) : false;
          quantity ? (newVal.quantity = quantity) : false;
          if (req.files) {
            const { img } = req.files;
            const type = img.mimetype.split('/')[1];
            let fileName = uuid.v4() + `.${type}`;
            img.mv(path.resolve(__dirname, '..', 'static', fileName));
            newVal.img = fileName;
          }

          if (info) {
            const parseInfo = JSON.parse(info);
            for (const item of parseInfo) {
              await DeviceInfo.findOne({ where: { id: item.id } }).then(
                async data => {
                  if (data) {
                    await DeviceInfo.update(
                      {
                        title: item.title,
                        description: item.description,
                      },
                      { where: { id: item.id } }
                    );
                  } else {
                    await DeviceInfo.create({
                      title: item.title,
                      description: item.description,
                      deviceId: id,
                    });
                  }
                }
              );
            }
          }

          await Device.update(
            {
              ...newVal,
            },
            { where: { id } }
          ).then(() => {
            return res.json('Device updated');
          });
        } else {
          return res.json("This Device doesn't exist in DB");
        }
      });
    } catch (e) {
      return res.json(e);
    }
  }
}

module.exports = new DeviceController();
