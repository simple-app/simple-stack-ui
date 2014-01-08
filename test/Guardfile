#!/usr/bin/env python

from livereload.task import Task
from livereload.compiler import shell

Task.add('views')
Task.add('public', shell('make build'))
