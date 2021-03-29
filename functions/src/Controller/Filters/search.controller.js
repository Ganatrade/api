const searchService = require("../../Services/Filters/search.services");

// routes -> /search
module.exports = {
    search: (req, res, next) =>
    {
        searchService
            .search(req, res)
            .then((users) => res.status(200).send(users))
            .catch((err) => next(err));
    }
}
