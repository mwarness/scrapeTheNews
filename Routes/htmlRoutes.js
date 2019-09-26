var db = require("../models");

module.exports = function (app) {

    app.get("/"), function (req, res) {
        var articArr = [];

        var handybObj = {
            articles: articArr

        }
        db.Article.find({}).then(function (data) {
            for (i = 0; i < 10; i++) {
                articArr.push(data[i]);
            }

            setTimeout(function () {
                res.render("index", handybObj);

            }, 500);
        })
    }


    app.get("/notes/:id", function (req, res) {

        var articArr = [];
        var noteArr = [];


        var handybObj = {
            articles: articArr,
            notes: notesArr
        }

        db.Article.findById(req.params.id)
            .populate("note")
            .then(function (data) {
                console.log(data);
                articArr.push(data)

                for (i = 0; i < data.comment.length; i++) {
                    noteArr.push(data.comment[i]);
                }

                console.log(handybObj.articles);
                console.log(handybObj.notes)
                res.render("notes", handybObj)
            })
    })

};