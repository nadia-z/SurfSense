class CreateSelectedForecasts < ActiveRecord::Migration[7.1]
  def change
    create_table :selected_forecasts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :location, null: false, foreign_key: true
      t.time :time_slow
      t.boolean :saved

      t.timestamps
    end
  end
end
