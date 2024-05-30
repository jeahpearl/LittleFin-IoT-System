const express = require('express');
const router = express.Router();
const Sensor = require('../models/sensor');
const multer = require('multer');
const fs = require('fs');

// Image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

// Insert data into database route
router.post('/add', upload, async (req, res) => {
    const sensor = new Sensor({
        tank_name: req.body.tank_name,
        temperature: req.body.temperature,
        fahrenheit: req.body.fahrenheit,
    });

    try {
        await sensor.save();
        req.session.message = {
            type: 'success',
            message: 'Sensor Data added Successfully!'
        };
        res.redirect('/homepage');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Edit data of sensor 
router.get('/edit/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const sensor = await Sensor.findById(id);
        if (sensor == null) {
            res.redirect('/homepage');
        } else {
            res.render('edit_data', {
                title: "Edit Data",
                sensor: sensor,
            });
        }
    } catch (err) {
        console.error("Error retrieving sensor:", err);
        res.redirect('/homepage');
    }
});

// Arduino Data to MongoDB
// Server-side: Dedicated endpoint for AJAX requests
// router.get("/api/sensors", async (req, res) => {
//     try {
//         const sensors = await Sensor.find({}).sort({ createdAt: -1 }); // Sort by createdAt in descending order
//         res.json(sensors);
//     } catch (err) {
//         console.error("Failed to retrieve sensors:", err);
//         res.status(500).send("Failed to retrieve data.");
//     }
// });

router.post("/homepage", function (req, res) {
    let newSensorData = new Sensor({
        tank_name: req.body.tank_name,
        temperature: req.body.temperature,
        fahrenheit: req.body.fahrenheit,
    });
  
    newSensorData
      .save()
      .then(() => res.status(201).send("Sensor data saved successfully."))
      .catch((err) => res.status(500).send("Error saving sensor data."));
  });

// Get all data route
router.get('/homepage', async (req, res) => {
    try {
        const sensor = await Sensor.find({}); 
        res.render('index', {
            title: 'Home Page',
            sensor: sensor
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

// Server-side: Dedicated endpoint for AJAX requests
router.get("/api/sensors", async (req, res) => {
    try {
        const sensors = await Sensor.find({}).sort({ createdAt: -1 }); // Sort by createdAt in descending order
        res.json(sensors);
    } catch (err) {
        console.error("Failed to retrieve sensors:", err);
        res.status(500).send("Failed to retrieve data.");
    } 
});

// Update sensor route
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await Sensor.findByIdAndUpdate(id, {
            tank_name: req.body.tank_name,
            temperature: req.body.temperature,
            fahrenheit: req.body.fahrenheit,
            image: new_image,
        });
        req.session.message = {
            type: 'success',
            message: 'Data updated Successfully!'
        };
        res.redirect("/homepage");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete sensor route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const result = await Sensor.findByIdAndDelete(id);
        if (result.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log("Error deleting file:", err);
            }
        }
        req.session.message = {
            type: 'info',
            message: 'Data deleted successfully'
        };
        res.redirect('/homepage');
    } catch (err) {
        console.error("Failed to delete sensor:", err);
        res.json({ message: err.message });
    }
});


// Routes
router.get('/', (req, res) => {
    res.send('Landing Page');
});

router.get('/homepage', (req, res) => {
    res.render('index', { title: 'Home Page' })
});

router.get('/add', (req, res) => {
    res.render('add_data', { title: "Add Data" });
})

router.get('/chart', (req, res) => {
    res.render('chart', { title: "Chart Visualization" })
})

// chart data route fetches query retrieves mongodb data to chart 
router.get('/api/chart-data', async (req, res) => {
    try {
        const sensors = await Sensor.find({}).sort({ created: -1 }).limit(10);

        // Log the fetched data to console for debugging
        // console.log(sensors);

        const labels = sensors.map(sensor => sensor.tank_name);
        const data = sensors.map(sensor => sensor.temperature);

        res.json({ labels, data });
    } catch (err) {
        console.error("Failed to retrieve sensors:", err);
        res.status(500).send("Failed to retrieve data.");
    }
});

// chart data route fetches query retrieves mongodb data to chart 
router.get('/api/new-chart-data', async (req, res) => {
    try {
        const sensors = await Sensor.find({}).sort({ created: -1 }).limit(10);

        // Log the fetched data to console for debugging
        // console.log(sensors);

        const labels = sensors.map(sensor => sensor.tank_name);
        const data = sensors.map(sensor => sensor.fahrenheit);

        res.json({ labels, data });
    } catch (err) {
        console.error("Failed to retrieve sensors:", err);
        res.status(500).send("Failed to retrieve data.");
    }
});

module.exports = router;