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

function calculateSeatDistribution(
    homeDiv, awayDiv, fanBaseHome, fanBaseAway,
    moraleHome, moraleAway, ratingHome, ratingAway,
    weather, matchFormat, finalAttendance
) {
    const baseDistributions = {
        "T20": {
            1: [37, 26, 23, 14],
            2: [40, 27, 20, 13],
            3: [44, 26, 18, 12],
            4: [46, 27, 15, 12],
            5: [48, 27, 14, 11]
        },
        "OD": {
            1: [41, 24, 19, 16],
            2: [43, 25, 17, 15],
            3: [45, 27, 15, 13],
            4: [47, 28, 14, 11],
            5: [49, 28, 13, 10]
        }
    };

    const weatherEffects = {
        "Sunny": { "T20": [1, 2, 2, 1], "OD": [2, 2, 1, 1] },
        "Overcast": { "T20": [-2, 3, 2, 1], "OD": [-3, 2, 1, 0] },
        "Hot": { "T20": [-4, 4, 3, -1], "OD": [-5, 5, 4, -2] }
    };

    let baseDist = baseDistributions[matchFormat][homeDiv];
    let adjustments = [...weatherEffects[weather][matchFormat]];

    if (fanBaseHome > fanBaseAway) {
        adjustments[2] += 1;
        adjustments[1] += 1;
    } else {
        adjustments[0] += 1;
    }

    if (moraleHome > 70) {
        adjustments[2] += 1;
        adjustments[3] += 1;
    }

    if (ratingHome > ratingAway) {
        adjustments[2] += 2;
    }

    let adjustedDist = baseDist.map((val, i) => val + adjustments[i]);
    let totalPercent = adjustedDist.reduce((a, b) => a + b, 0);
    let normalizedDist = adjustedDist.map(p => p / totalPercent);
    let seatCounts = normalizedDist.map(p => Math.round(p * finalAttendance));

    let totalSeats = seatCounts.reduce((a, b) => a + b, 0);
    let difference = finalAttendance - totalSeats;
    if (difference !== 0) {
        seatCounts[0] += difference;
    }

    return {
        "Standard": seatCounts[0],
        "Deluxe": seatCounts[1],
        "Premium": seatCounts[2],
        "Members": seatCounts[3]
    };
}

function calculateHomeParticipation(homeDiv, awayDiv, weather, matchFormat) {
    let baseHomeParticipation = 0.50;
    let divisionFactor = (6 - homeDiv) * 0.04;
    let awayDivisionFactor = (6 - awayDiv) * -0.03;

    if (homeDiv === 1 && awayDiv === 5) return [0.83, 0.17];

    const weatherFactors = { "Sunny": 0.05, "Overcast": 0.09, "Hot": 0.08 };
    const formatFactors = { "OD": 0.02, "T20": 0.04 };

    let homeParticipation = baseHomeParticipation + divisionFactor + awayDivisionFactor +
        (weatherFactors[weather] || 0) + (formatFactors[matchFormat] || 0);

    if (homeDiv === awayDiv) {
        homeParticipation = Math.max(0.58, Math.min(0.66, homeParticipation));
    } else {
        homeParticipation = Math.max(0.45, Math.min(0.70, homeParticipation));
    }

    return [homeParticipation.toFixed(2), (1 - homeParticipation).toFixed(2)];
}



function calculateAttendance(homeDiv, awayDiv, fanBaseHome, fanBaseAway, moraleHome, moraleAway, ratingHome, ratingAway, weather, matchFormat) {
    function logisticFunction(x, midpoint, steepness, maxValue) {
        return maxValue / (1 + Math.exp(-steepness * (x - midpoint)));
    }

    function exponentialRatingImpact(rating, scaleFactor = 0.05) {
        const RATING_MIN = 800, RATING_MAX = 2400;
        let normalizedRating = (rating - RATING_MIN) / (RATING_MAX - RATING_MIN);
        return Math.exp(scaleFactor * normalizedRating) - 1;
    }

    let baseHome = 5000 + (ratingHome - 800) / 1600 * (15000 - 5000);
    let baseAway = 5000 + (ratingAway - 800) / 1600 * (15000 - 5000);

    let ratingImpactHome = exponentialRatingImpact(ratingHome);
    let ratingImpactAway = exponentialRatingImpact(ratingAway);

    let moraleImpactHome = logisticFunction(moraleHome, 50, 0.15, 0.1);
    let moraleImpactAway = logisticFunction(moraleAway, 50, 0.15, 0.1);

    let loyalHome = Math.round(fanBaseHome * (1 + moraleImpactHome + ratingImpactHome));
    let loyalAway = Math.round(fanBaseAway * (1 + moraleImpactAway + ratingImpactAway));

    let adjustedHome = Math.round(baseHome + loyalHome);
    let adjustedAway = Math.round(baseAway + loyalAway);

    let [homePart, awayPart] = calculateHomeParticipation(homeDiv, awayDiv, weather, matchFormat);

    let totalAttendance = Math.round(adjustedHome * homePart) + Math.round(adjustedAway * awayPart);

    let distribution = calculateSeatDistribution(homeDiv, awayDiv, fanBaseHome, fanBaseAway, moraleHome, moraleAway, ratingHome, ratingAway, weather, matchFormat, totalAttendance);
    distribution['Total'] = totalAttendance;

    return distribution;
}


function calculate() {
    homediv = document.getElementById('homeDivision').value;
    homefanbase = Number(document.getElementById('homeFans').value);
    homerating = Number(document.getElementById('homeRating').value);
    homemorale = Number(document.getElementById('homeMorale').value);
    awaydiv = document.getElementById('awayDivision').value;
    awayfanbase = Number(document.getElementById('awayFans').value);
    awayrating = Number(document.getElementById('awayRating').value);
    awaymorale = Number(document.getElementById('awayMorale').value);
    w = document.getElementById('weather').value;
    m = document.getElementById('match').value;

    let result = calculateAttendance(homediv, awaydiv, homefanbase, awayfanbase, homemorale, awaymorale, homerating, awayrating, w, m);
    return result;

}



function simulateSubmission() {
    homediv = document.getElementById('homeDivision').value;
    homefanbase = Number(document.getElementById('homeFans').value);
    homerating = Number(document.getElementById('homeRating').value);
    homemorale = Number(document.getElementById('homeMorale').value);
    awaydiv = document.getElementById('awayDivision').value;
    awayfanbase = Number(document.getElementById('awayFans').value);
    awayrating = Number(document.getElementById('awayRating').value);
    awaymorale = Number(document.getElementById('awayMorale').value);
    w = document.getElementById('weather').value;
    m = document.getElementById('match').value;

    if (homediv && awaydiv && homefanbase && awayfanbase && homemorale && awaymorale && homerating && awayrating && w && m) {
        let results = calculate()
        // console.log(results);
        // console.log(results['Total']);
        // console.log(results['Standard']);
        // console.log(results['Premium']);
        // console.log(results['Deluxe']);
        // console.log(results['Members']);
        // "Standard", "Deluxe","Premium", "Members"
        document.getElementById("total").innerHTML = `Total: ${results['Total']}`
        document.getElementById("standard").innerHTML = `Standard: ${results['Standard']}`
        document.getElementById("deluxe").innerHTML = `Deluxe: ${results['Deluxe']}`
        document.getElementById("premium").innerHTML = `Premium: ${results['Premium']}`
        document.getElementById("members").innerHTML = `Members: ${results['Members']}`
        return 'success';

    }
    else {
        // const myElement = document.getElementById("tv2");
        // // Set fixed dimensions (important for consistent appearance)
        // myElement.style.width = "290px";  // Example width. Adjust as needed.
        // myElement.style.height = "150px"; // Example height. Adjust as needed.
        // myElement.style.background = "repeating-radial-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 0/2500px 2500px, repeating-conic-gradient(#000 0 0.0001%,#fff 0 0.0002%) 60% 60%/2500px 2500px";
        // myElement.style.backgroundBlendMode = "difference";

        // // Create the animation dynamically (if not already in CSS)
        // const styleSheet = document.createElement("style");
        // styleSheet.innerHTML = "@keyframes b { 100% { background-position: 50% 0, 60% 50% } }";
        // document.head.appendChild(styleSheet);

        // myElement.style.animation = "b .2s infinite alternate";

        document.getElementById("total").innerHTML = `Input <br> missing !! `
        document.getElementById("total").style.color = 'black';
        document.getElementById("tv2").style.backgroundColor = '#cdcdcd';
        document.getElementById("total").style.fontSize = '35px';
        document.getElementById("standard").innerHTML = ``
        document.getElementById("deluxe").innerHTML = ``
        document.getElementById("premium").innerHTML = ``
        document.getElementById("members").innerHTML = ``
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
