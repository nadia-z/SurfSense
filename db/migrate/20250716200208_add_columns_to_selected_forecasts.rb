class AddColumnsToSelectedForecasts < ActiveRecord::Migration[7.1]
  def change
    add_column :selected_forecasts, :swellDirection, :integer
    add_column :selected_forecasts, :swellHeight, :integer
    add_column :selected_forecasts, :swellPeriod, :float
    add_column :selected_forecasts, :waveDirection, :integer
    add_column :selected_forecasts, :waveHeight, :float
    add_column :selected_forecasts, :wavePeriod, :float
  end
end
