import sys
import time
import struct
import json

def get_message ():
	"""Read a message from stdin and decode it."""
	rawLength = sys.stdin.buffer.read(4)
	if len(rawLength) == 0:
		sys.exit(0)
	messageLength = struct.unpack('@I', rawLength)[0]
	message = sys.stdin.buffer.read(messageLength).decode('utf-8')
	return json.loads(message) #json.loads(message).split(':',1)

def send_message(*args):
	""" Send an encoded message to stdout"""
	msg = ''
	for arg in args:
		msg += arg
	encodedContent = json.dumps(msg).encode('utf-8')		
	sys.stdout.buffer.write(struct.pack('@I', len(encodedContent)))
	sys.stdout.buffer.write(encodedContent)
	sys.stdout.buffer.flush()
	
def callJs (*args):
	 send_message(args[0]+':'+'/'.join(args[1:]))

while True:
	time.sleep (.05)
#	send_message (get_message())
	callJs ('two', get_message(), 'from Python')