class FixDataTypesInSelectedForecasts < ActiveRecord::Migration[7.1]
  def change
    # Fix data types
    change_column :selected_forecasts, :swellHeight, :float
    change_column :selected_forecasts, :swellDirection, :string
    change_column :selected_forecasts, :waveDirection, :string
    change_column :selected_forecasts, :time_slot, :string
  end
end
