class Location < ApplicationRecord
  belongs_to :user
  has_one :selected_forecast

  include PgSearch::Model

  pg_search_scope :search_by_title_and_synopsis,
  against: [ :address, :latitutde, :longitude ],
  using: {
    tsearch: { prefix: true } # <-- now `superman batm` will return something!
  }

end
