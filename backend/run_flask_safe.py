import os
import subprocess
import signal
import time

PORT = 5000

# Step 1: Check if port 5000 is in use
def get_pid_using_port(port):
    try:
        result = subprocess.check_output(["lsof", "-ti", f":{port}"])
        pids = result.decode().strip().split('\n')
        return [int(pid) for pid in pids if pid]
    except subprocess.CalledProcessError:
        return []

# Step 2: Kill the process(es)
def kill_processes(pids):
    for pid in pids:
        try:
            os.kill(pid, signal.SIGKILL)
            print(f"✅ Killed process on port {PORT}: PID {pid}")
        except Exception as e:
            print(f"⚠️ Failed to kill PID {pid}: {e}")

# Step 3: Run Flask app
def run_flask_app():
    print("🚀 Starting Flask app...")
    os.system("python app.py")

if __name__ == "__main__":
    pids = get_pid_using_port(PORT)
    if pids:
        print(f"🔎 Port {PORT} is in use. Attempting to free it...")
        kill_processes(pids)
        time.sleep(1)
    else:
        print(f"✅ Port {PORT} is free.")

    run_flask_app()
