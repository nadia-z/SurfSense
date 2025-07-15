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
