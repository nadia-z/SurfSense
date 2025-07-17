require 'json'

class LocationsController < ApplicationController

  def forecast_slots
    # this logic will have to be replaced by the API sending forecast time-slots
    # for the all day
    file = File.read("lib/assets/time_slots.json")
    @forecasts = JSON.parse(file)
  end

end
