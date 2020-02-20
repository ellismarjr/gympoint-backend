import * as Yup from 'yup';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

import { parseISO, format, isPast, addMonths } from 'date-fns';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      order: [['end_date', 'ASC']],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations Fails!' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Check if student exists
     */
    const studentExists = await Student.findByPk(student_id);
    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not exists!' });
    }

    /**
     * Check if plan exists
     */
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists!' });
    }

    const datePast = isPast(parseISO(start_date));
    if (datePast) {
      return res.status(400).json({ error: 'Past dates are not permitted!' });
    }

    const { duration, price } = plan;

    const end_date = addMonths(new Date(start_date), duration);

    const amount = price * duration;

    const enrollment = await Enrollment.create({
      start_date,
      end_date,
      student_id,
      plan_id,
      price: amount,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations Fails!' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not existst!' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Check if student exists
     */
    const studentExists = await Student.findByPk(student_id);
    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not exists!' });
    }

    /**
     * Check if plan exists
     */
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists!' });
    }

    const datePast = isPast(parseISO(start_date));
    if (datePast) {
      return res.status(400).json({ error: 'Past dates are not permitted!' });
    }

    const { duration, price } = plan;

    const end_date = format(
      addMonths(parseISO(start_date), duration),
      'yyyy-MM-dd'
    );

    const amount = price * duration;

    await enrollment.update({
      start_date,
      end_date,
      price: amount,
      student_id,
      plan_id,
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exists!' });
    }

    await enrollment.destroy();

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
