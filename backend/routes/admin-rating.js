import express from 'express';
import { Rating, Student } from '../models/models';
import setResponse from '../setResponse';

const router = express.Router();

// see a student's rating of others and others' rating of this student
router.get('/:studentId', (req, res) => {
  let student;
  let rated;
  Student.findById(req.params.studentId, { password: 0, createdBy: 0, lastModifiedBy: 0 })
    .then((stu) => {
      if (!stu) throw new Error('Invalid student ID');
      student = stu;
      return Rating.find({ student: stu.id }).populate('partner student', 'name');
    })
    .then((result) => {
      // if (ratings.length === 0) {
      //   return setResponse(res, 400, true, {student, error: 'No ratings found'})
      // }
      rated = result.slice();
      return Rating.find({ partner: student.id }).populate('student partner', 'name');
    })
    .then(ratings => setResponse(res, 200, true, { rated, ratings }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

export default router;
