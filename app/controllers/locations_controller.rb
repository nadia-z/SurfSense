require 'json'

class LocationsController < ApplicationController

  def forecast_slots
    # this logic will have to be replaced by code to request selected forecast for a given location and date from an API
    file = File.read("lib/assets/time_slots.json")
    @forecasts = JSON.parse(file)
  end

  private


end
