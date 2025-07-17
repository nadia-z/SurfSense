class Location < ApplicationRecord
  belongs_to :user
  has_one :selected_forecast

  include PgSearch::Model

  pg_search_scope :search_location,
    against: [ :break, :region, :country, :latitude, :longitude ],
    using: {
      tsearch: { prefix: true }
  }

end
