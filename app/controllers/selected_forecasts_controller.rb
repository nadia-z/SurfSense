class SelectedForecastsController < ApplicationController
  before_action :authenticate_user!

  def create
    # Check if a forecast for this location and time already exists
    existing_forecast = current_user.selected_forecasts.find_by(
      region: params[:selected_forecast][:region],
      country: params[:selected_forecast][:country],
      break: params[:selected_forecast][:break],
      time_slot: params[:selected_forecast][:time_slot]
    )

    if existing_forecast
      # Update existing forecast instead of creating new one
      if existing_forecast.update(selected_forecast_params)
        render json: { status: 'success', message: 'Forecast updated successfully!' }
      else
        render json: { status: 'error', errors: existing_forecast.errors.full_messages }
      end
    else
      # Create new forecast
      @selected_forecast = current_user.selected_forecasts.build(selected_forecast_params)

      if @selected_forecast.save
        render json: { status: 'success', message: 'Forecast saved successfully!' }
      else
        render json: { status: 'error', errors: @selected_forecast.errors.full_messages }
      end
    end
  end

  def index
    @selected_forecasts = current_user.selected_forecasts
  end

  def show
    @selected_forecast = current_user.selected_forecasts.find(params[:id])
  end

  def destroy
    @selected_forecast = current_user.selected_forecasts.find(params[:id])
    @selected_forecast.destroy
    render json: { status: 'success', message: 'Forecast deleted successfully!' }
  end

  private

  def selected_forecast_params
    params.require(:selected_forecast).permit(:region, :country, :break, :time_slot, :swellHeight, :swellPeriod,
                                            :swellDirection, :waveHeight, :wavePeriod, :waveDirection,
                                            :wind_speed, :wind_direction, :temperature, :tide, :saved)
  end
end
