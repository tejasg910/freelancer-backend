const { searchService } = require("../services/search.service");

const search = async (req, res) => {
    const { page = 1, size = 10, userType } = req.query;
    const {
        searchString,
        minBudget,
        maxBudget,
        availability,
        skill,
        experience,
        sort,
        duration

    } = req.body;
    const response = await searchService({
        searchString,
        page,
        size,
        skill,
        minBudget,
        maxBudget,
        availability,
        experience,
        sort,
        duration
    })

    res.status(response.status).json({
        ...response
    })
}


module.exports = {
    search
}
