class AddSuggestedToLocations < ActiveRecord::Migration[7.1]
  def change
    add_column :locations, :suggested, :boolean
  end
end
