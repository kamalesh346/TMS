const getTestData = (req, res) => {
  res.json({ message: '✅ Test route is working!' });
};

module.exports = { getTestData };
