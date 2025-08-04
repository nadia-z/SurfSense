class Location < ApplicationRecord
  belongs_to :user
  # Removed has_one :selected_forecast association since we restructured the database
  # to use region/country/break fields instead of location_id foreign key

  include PgSearch::Model

  pg_search_scope :search_location,
    against: [ :break, :region, :country, :latitude, :longitude ],
    using: {
      tsearch: { prefix: true }
  }

end
