import * as Yup from 'yup';
import { Op } from 'sequelize';

import Student from '../models/Student';

class StudentController {
  async show(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not exists!' });
    }

    return res.json(student);
  }

  async index(req, res) {
    const { page, searchStudent } = req.query;

    if (page) {
      const limit = 5;

      const where = searchStudent
        ? { name: { [Op.iLike]: `%${searchStudent}%` } }
        : {};

      const studentsCount = await Student.count({ where });

      const lastPage = page * limit >= studentsCount;

      const students = await Student.findAll({
        order: [['name', 'ASC']],
        where,
        limit,
        offset: (page - 1) * limit,
      });

      return res.json({ lastPage, content: students });
    }

    const students = await Student.findAll();

    return res.json(students);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.string().required(),
      weight: Yup.string().required(),
      height: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails!' });
    }

    const emailExists = await Student.findOne({
      where: { email: req.body.email },
    });
    if (emailExists) {
      return res.status(400).json({ error: 'E-mail already registered!' });
    }

    const { id, name, age, weight, height } = await Student.create(req.body);

    return res.json({ id, name, age, weight, height });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.string(),
      weight: Yup.string(),
      height: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails!' });
    }

    /**
     * Check if students exists
     */
    const students = await Student.findByPk(req.params.id);
    if (!students) {
      return res.status(400).json({ error: 'Student not exists!' });
    }

    /**
     * Check if email already exists
     */
    const { email } = req.body;
    if (email !== students.email) {
      const emailExists = await Student.findOne({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ error: 'E-mail already registered!' });
      }
    }

    const { id, name, age, weight, height } = await students.update(req.body);

    return res.json({ id, name, age, weight, height });
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student not exists!' });
    }

    await student.destroy();

    return res.json(student);
  }
}

export default new StudentController();
