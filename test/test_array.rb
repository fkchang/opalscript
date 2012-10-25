# class TestArray < OpalTest::TestCase
#   def test_clear
#     a = [1, 2, 3, 4]
#     a.clear
#     assert_eql [], a

#     a = [1]
#     old = a.object_id
#     assert_equal old, a.clear.object_id

#     a = [1]
#     a.clear
#     assert a.empty?
#     assert_equal 0, a.size
#   end
# end