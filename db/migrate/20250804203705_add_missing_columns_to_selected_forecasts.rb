class AddMissingColumnsToSelectedForecasts < ActiveRecord::Migration[7.1]
  def change
    add_column :selected_forecasts, :wind_speed, :float
    add_column :selected_forecasts, :wind_direction, :string
    add_column :selected_forecasts, :temperature, :float
    add_column :selected_forecasts, :tide, :string
  end
end
