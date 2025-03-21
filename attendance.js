function updateSlider(inputID, sliderID) {
    const slider = document.getElementById(sliderID);
    const input = document.getElementById(inputID);
    slider.value = input.value;
}

function updateSliderValue(inputID, sliderID) {
    const slider = document.getElementById(sliderID);
    const input = document.getElementById(inputID);
    input.value = slider.value;
}


async function calculateAttendance(homediv, awaydiv, homefanbase, awayfanbase, homemorale, awaymorale, homerating, awayrating, w, m) {
    const data = {
        "home_div": homediv,
        "away_div": awaydiv,
        "fan_base_home": homefanbase,
        "fan_base_away": awayfanbase,
        "morale_home": homemorale,
        "morale_away": awaymorale,
        "rating_home": homerating,
        "rating_away": awayrating,
        "weather": w,
        "match_format": m
    };
    try {
        const response = await fetch('https://calculateattendance.onrender.com/calculate_attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log('Attendance Prediction:', result);

        if (result) {
            result.forEach(item => {
                const element = document.getElementById(item.category.toLowerCase()); 
                if (element) {
                    element.innerHTML = `${item.category}: ${item.attendance}`;
                }
            });

        } else {
            document.getElementById("total").innerHTML = `Error in API response`;
        }

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}


function simulateSubmission() {
    const homediv = parseInt((document.getElementById('homeDivision').value).slice(-1));
    const homefanbase = parseInt(document.getElementById('homeFans').value);
    const homerating = parseInt(document.getElementById('homeRating').value);
    const homemorale = parseInt(document.getElementById('homeMorale').value);
    const awaydiv = parseInt((document.getElementById('awayDivision').value).slice(-1));
    const awayfanbase = parseInt(document.getElementById('awayFans').value);
    const awayrating = parseInt(document.getElementById('awayRating').value);
    const awaymorale = parseInt(document.getElementById('awayMorale').value);
    const w = document.getElementById('weather').value;
    const m = document.getElementById('match').value;

    if (homediv && awaydiv && homefanbase && awayfanbase && homemorale && awaymorale && homerating && awayrating && w && m) {

        calculateAttendance(homediv, awaydiv, homefanbase, awayfanbase, homemorale, awaymorale, homerating, awayrating, w, m);

        return 'success';
    } else {
        document.getElementById("total").innerHTML = `Input <br> missing !! `;
        document.getElementById("total").style.color = 'black';
        document.getElementById("tv2").style.backgroundColor = '#cdcdcd';
        document.getElementById("total").style.fontSize = '35px';
        document.getElementById("standard").innerHTML = ``;
        document.getElementById("deluxe").innerHTML = ``;
        document.getElementById("premium").innerHTML = ``;
        document.getElementById("members").innerHTML = ``;
        return 'error';
    }
}

var animateButton = function (e) {
    e.preventDefault();
    var btn = e.target;
    // Remove any previous animation classes.
    btn.classList.remove('animate', 'success', 'error');
    // Start the base animation.
    btn.classList.add('animate');

    setTimeout(function () {
        var outcome = simulateSubmission();
        document.getElementById('validation').textContent = outcome;
        btn.classList.add(outcome);
    }, 250);

    // Reset the button's classes after 6 seconds so it can be re-triggered.
    setTimeout(function () {
        btn.classList.remove('animate', 'success', 'error');
    }, 2500);
};

document.getElementById("submit-btn").addEventListener('click', animateButton, false);
