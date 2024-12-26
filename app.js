const express = require("express");
const fs = require('fs')
const app = express();


const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))
app.use(express.json())

function binarySearch(tours, id) {
  let i = 0, j = tours.length - 1;
  while (i <= j ) {
    let mid = Math.floor((i + j)/ 2)
    console.log(tours[mid])
    if(tours[mid].id === id) return tours[mid]
    else if (tours[mid].id < id) i = mid + 1;
    else j = mid - 1
  }

  return []
}


function getAllTours(req, res) {
res.status(200).json({message: 'Successsfull GET Request', data : {
    tours
}})
}

function postTour(req, res) {
   console.log(req.body)
  //MONGO functioning code here
  res.send("Sucessful POST Request")
 
}

function getTourById(req, res) {
const id = req.params.id * 1;   //convert to integer
  const requiredTour = binarySearch(tours, id) 

  res.status(200).json({message : 'Successfull GET by URL Parameters', data : {tour : requiredTour}})

}

function deleteTour(req, res) {
  res.send('DELETE Request')
}

function patchTour(req, res) {
res.send("Patch Request")

}


app.route('/api/v1/tours').get(getAllTours).post(postTour).delete(deleteTour).patch(patchTour)

app.route('/api/v1/tours/:id').get(getTourById)

app.listen(3000, () => {
  console.log("dssds");
});
