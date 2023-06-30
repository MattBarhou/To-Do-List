const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const _ = require("lodash");

const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
main().catch(err=> console.log(err));
async function main(){
  await mongoose.connect('mongodb+srv://barhoumatthew:Bedroom123@cluster0.r34mydt.mongodb.net/todolistDB');
}
 
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    max: 30,
  }
});
 
const Item = mongoose.model("Item",itemsSchema)
 
const item1 = new Item({
  name: "Welcome to your todolist!"
});
 
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3]
 
const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);
 
app.get('/favicon.ico', (req, res) => {
  res.status(204)
});
 
app.get("/", function(req, res) {
  Item.find()
    .then(items => {
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            res.redirect("/");
          }) 
      } else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    })
    .catch(err => {
      console.log(err);
    });
}); 

app.get("/:customList", function (req, res) {
  const customList = _.capitalize(req.params.customList);

  List.findOne({ name: customList })
    .then(foundList => {
      if (!foundList) {

        const list = new List({
          name: customList,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customList);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch((err) => {
      console.log(err);
    });
})

 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName})
    .then(foundList => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then((err) => {
      res.redirect("/");

    })
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(foundList => {
      res.redirect("/" + listName)
    })
    .catch(err => {
      console.log(err);
    })
  }

})
 

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});


