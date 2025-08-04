require "test_helper"

class SelectedForecastsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get selected_forecasts_create_url
    assert_response :success
  end

  test "should get index" do
    get selected_forecasts_index_url
    assert_response :success
  end

  test "should get show" do
    get selected_forecasts_show_url
    assert_response :success
  end

  test "should get destroy" do
    get selected_forecasts_destroy_url
    assert_response :success
  end
end
