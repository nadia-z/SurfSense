class ChangeTimeSlowToTimeSlotInSelectedForecasts < ActiveRecord::Migration[7.1]
  def change
    rename_column :selected_forecasts, :time_slow, :time_slot
  end
end
