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
  password: "password123",
  first_name: "Nicola",
  last_name: "Bergamaschi"
)

user2 = User.create!(
  email: "user2@example.com",
  password: "password123",
  first_name: "Jane",
  last_name: "Smith"
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

puts("Locations created succesfully✅")
puts("Seeding SelectedForecasts...")


SelectedForecast.create!(
  user: user1,
  location: location1,
  time_slot: "09:00",
  saved: true,
  swellDirection: 180,
  swellHeight: 3,
  swellPeriod: 12.5,
  waveDirection: 185,
  waveHeight: 2.5,
  wavePeriod: 8.0
)

SelectedForecast.create!({
  user:user1,
  location: location2,
  time_slot: "03:00",
  swellDirection: 40,
  swellHeight: 1,
  swellPeriod: 4.5,
  waveDirection: 28,
  waveHeight: 1.1399999856948853,
  wavePeriod: 5.449999809265137,
  saved: true,
})

puts("Forecasts created succesfully✅")
puts("All done 🤯!")
