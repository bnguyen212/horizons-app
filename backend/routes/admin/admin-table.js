import express from 'express';
import { Table } from '../../models/models';
import setResponse from '../../util/setResponse';

const router = express.Router();

router.get('/', (req, res) => {
  Table.find().sort({ table: 1 })
    .then(tables => setResponse(res, 200, true, { tables }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// only admin users has access
router.use('*', (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return setResponse(res, 401, false, { error: 'Only Admin users have access' });
});

router.post('/new', (req, res) => {
  if (!req.body.table || !req.body.building) {
    return setResponse(res, 400, false, { error: 'Missing parameter(s)' });
  }
  return Table.findOne({ table: req.body.table })
    .then((table) => {
      if (table) throw new Error('Table name already exist');
      const newTable = new Table({
        table: req.body.table,
        building: req.body.building,
        createdBy: req.user.id,
        lastModifiedBy: { time: new Date(), user: req.user.id }
      });
      return newTable.save();
    })
    .then(table => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

router.post('/:tableId', (req, res) => {
  if (!req.body.table) {
    return setResponse(res, 400, false, { error: 'Missing parameter' });
  }
  return Table.findOne({ table: req.body.table })
    .then((table) => {
      if (table) throw new Error('Table name already exist');
      return Table.findByIdAndUpdate(req.params.tableId, {
        table: req.body.table,
        lastModifiedBy: { time: new Date(), user: req.user.id }
      }, { new: true, runValidators: true });
    })
    .then(table => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

router.delete('/:tableId', (req, res) => {
  Table.findByIdAndRemove(req.params.tableId)
    .then((table) => {
      if (!table) throw new Error('Invalid table ID');
      return setResponse(res, 200, true);
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

export default router;
