class AddColumnsToLocations < ActiveRecord::Migration[7.1]
  def change
    add_column :locations, :break, :string
    add_column :locations, :region, :string
    add_column :locations, :country, :string
  end
end
