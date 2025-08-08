# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end




#           ------------------  IMPORTANT -------------------------       #

# When seeding need to remember that now there is a column 'suggested' in
# the model location, I made it a boolean so to define which location will be
# displayed on the page index/home during/while waiting for the search result

# Also I linked the location to the forecast via a foreign key, I though that we can use the data from the location to trigger a request to the API, for now though we can just have a static JSON.

puts("Seeding users...")

user1 = User.create!(
  email: "nicola.bergamaschi@gmail.com",
  password: "pass123",
  first_name: "Nicola",
  last_name: "Bergamaschi"
)

user2 = User.create!(
  email: "nzeissig@googlemail.com",
  password: "pass123",
  first_name: "Nadia",
  last_name: "Zeissig"
)

puts("Users created succesfully✅")
puts("Seeding locations...")

location1 = Location.create!(
  latitude: 40.7128,
  longitude: -74.0060,
  user: user1,
  break: "Montauk",
  region: "New York",
  country: "USA",
  suggested: true
)

location2 = Location.create!({
  latitude: 28.1511,
  longitude: -15.5334,
  user: user1,
  break: "Los Enanos",
  region: "Gran Canaria",
  country: "Spain",
  suggested: true
})

location3 = Location.create!(
  latitude: 37.0654,
  longitude: -8.8101,
  user: user2,
  break: "Boca do rio",
  region: "Algarve",
  country: "Portugal",
  suggested: true
)

location3 = Location.create!({
  latitude: 28.1511,
  longitude: -15.5334,
  user: user2,
  break: "Los Enanos",
  region: "Gran Canaria",
  country: "Spain",
  suggested: true
})

puts("Locations created succesfully✅")
puts("Seeding SelectedForecasts...")


SelectedForecast.create!(
  user: user1,
  time_slot: "9AM",
  saved: true,
  swellDirection: 'ENE',
  swellHeight: 3,
  swellPeriod: 12.5,
  waveDirection: 'WSW',
  waveHeight: 2.5,
  wavePeriod: 8.0,
  wind_speed: 20.50,
  wind_direction: 'ENE',
  temperature: 28.5,
  tide: 'Mid-Low',
  country: 'Canary',
  region: 'Gran Canaria',
  break: 'Los enanos'
)

SelectedForecast.create!({
  user: user1,
  time_slot: "6PM",
  saved: true,
  swellDirection: 'SE',
  swellHeight: 4,
  swellPeriod: 20.5,
  waveDirection: 'NNE',
  waveHeight: 1.5,
  wavePeriod: 5.0,
  wind_speed: 10.50,
  wind_direction: 'ESE',
  temperature: 15.5,
  tide: 'High',
  country: 'Canary',
  region: 'Gran Canaria',
  break: 'Playa del hombre'
})

SelectedForecast.create!(
  user: user2,
  time_slot: "9AM",
  saved: true,
  swellDirection: 'ENE',
  swellHeight: 3,
  swellPeriod: 12.5,
  waveDirection: 'WSW',
  waveHeight: 2.5,
  wavePeriod: 8.0,
  wind_speed: 20.50,
  wind_direction: 'ENE',
  temperature: 28.5,
  tide: 'Mid-Low',
  country: 'Canary',
  region: 'Gran Canaria',
  break: 'Los enanos'
)

SelectedForecast.create!({
  user: user2,
  time_slot: "6PM",
  saved: true,
  swellDirection: 'SE',
  swellHeight: 4,
  swellPeriod: 20.5,
  waveDirection: 'NNE',
  waveHeight: 1.5,
  wavePeriod: 5.0,
  wind_speed: 10.50,
  wind_direction: 'ESE',
  temperature: 15.5,
  tide: 'High',
  country: 'Canary',
  region: 'Gran Canaria',
  break: 'Playa del hombre'
})

puts("Forecasts created succesfully✅")
puts("All done 🤯!")
