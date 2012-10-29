require 'bundler/setup'
require 'opal-script/rake_task'

task :default do
  File.open('build/out.js', 'w+') do |o|
    o.puts OpalScript.parse(File.read('build/in.rb'))
  end
end

OpalScript::RakeTask.new do |t|
  t.files        = []   # we handle this by Opal.runtime instead
  # t.parser       = true
end

desc "Build opal-test"
task :opal_test do
  File.open('build/opal-test.js', 'w+') do |o|
    o.puts OpalScript.build_files 'opal-test'
  end
end

desc "Build all tests"
task :tests do
  File.open('build/tests.js', 'w+') do |o|
    o.puts OpalScript.build_files 'test'
  end
end

desc "Rebuild grammar.rb for opal parser"
task :racc do
  %x(racc -l lib/opal-script/grammar.y -o lib/opal-script/grammar.rb)
end

desc "Check file sizes for opal.js runtime"
task :sizes do
  o = File.read 'build/opal.js'
  m = uglify o
  g = gzip m

  puts "opal.js:"
  puts "development: #{o.size}, minified: #{m.size}, gzipped: #{g.size}"
end

# Used for uglifying source to minify
def uglify(str)
  IO.popen('uglifyjs -nc', 'r+') do |i|
    i.puts str
    i.close_write
    return i.read
  end
end

# Gzip code to check file size
def gzip(str)
  IO.popen('gzip -f', 'r+') do |i|
    i.puts str
    i.close_write
    return i.read
  end
end