const data = {
    home_div: 1,
    away_div: 1,
    fan_base_home: 100,
    fan_base_away: 10000,
    morale_home: 50,
    morale_away: 50,
    rating_home: 1500,
    rating_away: 1500,
    weather: "Sunny",
    match_format: "OD"
};

var response = await fetch('https://calculateattendance.onrender.com/calculate_attendance', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
})
console.log(await response.json());
var response= await fetch('https://calculateattendance.onrender.com')  // Replace with your API URL
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));


