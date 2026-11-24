# Airwise

A browser-based clean-air day planner for families and communities navigating winter smog and urban air pollution. It tailors practical routines, indoor-air suggestions, sustainable swaps, and estimated travel-emissions impact to the household's reported AQI, location, and commute.

## Run locally

Open `index.html` in a browser, or serve this directory with any static web server. The app has no build step, dependencies, account, or API key. Planning details remain in the browser and are not saved or sent to a service.

## How recommendations work

The planner uses the location, reported AQI category, household profile, commute mode, distance, and commute days to select relevant guidance. It does not retrieve live AQI data or provide medical advice; check local environmental and public-health guidance for current conditions.

For car commuters, the weekly impact estimate assumes two car-free round trips at 0.25 kg CO₂e per car kilometre. Actual emissions vary by vehicle and trip, so treat this as an illustration rather than a measured result.
