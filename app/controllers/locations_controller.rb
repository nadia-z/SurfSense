require 'json'

class LocationsController < ApplicationController

  def new
    @location = Location.new()
  end

  def create
    @location = current_user.locations.build(location_params)

    respond_to do |format|
      if @location.save
        format.html { redirect_to root_path, notice: 'Location saved successfully!' }
        format.json { render json: { status: 'success', message: 'Location saved successfully!' } }
      else
        format.html { redirect_to root_path, alert: 'Failed to save location.' }
        format.json { render json: { status: 'error', message: 'Failed to save location.', errors: @location.errors } }
      end
    end
  end

  def forecast_slots
    # this logic will have to be replaced by code to request selected forecast for a given location and date from an API
    file = File.read("lib/assets/time_slots.json")
    @forecasts = JSON.parse(file)
  end

  private

  def location_params

    params.require(:location).permit(:latitude, :longitude, :region, :country, :break)

  end

end
