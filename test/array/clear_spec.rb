describe "Array#clear" do
  it "removes all elements" do
    a = [1, 2, 3, 4]
    a.clear
    assert_eql [], a
  end

  it "returns self" do
    a = [1]
    old = a.object_id
    assert_equal old, a.clear.object_id
  end

  it "leaves the Array empty" do
    a = [1]
    a.clear
    assert a.empty?
    assert_equal 0, a.size
  end
end