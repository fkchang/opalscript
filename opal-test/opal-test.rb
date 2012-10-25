module OpalTest
  class Assertion < Exception; end

  module Assertions
    def assert(test, msg = "Failed assertion, no message given.")
      unless test
        raise OpalTest::Assertion, msg
      end
    end

    def assert_equal(exp, act, msg = nil)
      msg ||= "Expected: #{inspect_obj exp}, Actual: #{inspect_obj act}"
      assert(exp == act, msg)
    end

    def assert_eql(exp, act, msg = nil)
      msg ||= "Expected: #{inspect_obj exp}, Actual: #{inspect_obj act} (eql?)"
      assert exp.eql?(act), msg
    end

    def inspect_obj(obj)
      obj == nil ? "nil" : obj.inspect
    end
  end

  class TestCase
    include OpalTest::Assertions

    attr_reader :_exception

    @suites = []
    def self.suites
      @suites
    end

    def self.inherited(klass)
      TestCase.suites.push klass
    end

    def self.test_methods
      instance_methods.select { |m| /^test_/.match m }
    end

    def initialize(test_name)
      @_test_name = test_name
    end

    def run(runner)
      begin
        @passed = nil
        __send__ @_test_name
        runner.test_passed self
        @passed = true
      rescue Exception => e
        @_exception = e
        runner.test_failed self
      ensure
      end
    end

    def to_formatted_name
      @_test_name
    end
  end

  class Spec < TestCase
    def self.create(desc, block)
      cls = Class.new(Spec)
      cls.class_eval &block
      cls
    end

    def self.it(desc, &block)
      define_method "test_#{desc}", &block
    end

    def to_formatted_name
      @_test_name.sub(/^test_/, '')
    end
  end

  class Runner
    # TODO: This should use the right Runner subclass. (BrowserRunner vs PhantomRunner)
    def self.autorun
      OpalTest::Runner.new.run
    end

    def run
      suites = OpalTest::TestCase.suites
      p suites
      suites.each { |s| run_suite s }
    end

    def run_suite(suite)
      test_suite_started suite

      suite.test_methods.each do |test_name|
        instance = suite.new test_name
        instance.run self
      end

      test_suite_finished suite
    end

    def test_suite_started(suite)
    end

    def test_suite_finished(suite)
    end

    def test_started(test_case)
    end

    # The given test case failed
    def test_failed(test_case)
      puts "FAILED: #{test_case.to_formatted_name} (#{test_case._exception.message})"
    end

    # The given test case finished running and passed
    def test_passed(test_case)
      puts "PASSED: #{test_case.to_formatted_name}"
    end
  end

  class BrowserRunner < Runner
  end

  class PhantomRunner < Runner
  end
end

module Kernel
  def describe(desc, &block)
    OpalTest::Spec.create desc, block
  end
end