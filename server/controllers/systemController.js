exports.healthCheck = (req, res) => {
  res.json({ status: "ok" });
};

exports.apiRoot = (req, res) => {
  res.json({ message: "Welcome to StudyBuddy API v1" });
};
