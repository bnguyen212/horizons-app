export default (res, status, success, additionalRes) => {
  const response = Object.assign({}, { status, success }, additionalRes);
  return res.json(response);
};
