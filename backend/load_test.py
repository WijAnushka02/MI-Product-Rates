#!/usr/bin/env python
"""
MI Product Rates Management System — Automated Load & Performance Benchmark Script
Simulates concurrent enterprise users querying and testing the REST API against Oracle Database.
"""

import time
import json
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
import statistics

BASE_URL = "http://localhost:8000/api/mi-product-rates/"


def make_request(request_id):
    """
    Sends a single HTTP GET request to the API and records response latency.
    """
    url = f"{BASE_URL}?search=DIA" if request_id % 2 == 0 else BASE_URL
    start_time = time.perf_counter()
    status_code = None
    error = None

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'LoadTester/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            status_code = response.getcode()
            response.read()
    except urllib.error.HTTPError as e:
        status_code = e.code
    except Exception as e:
        error = str(e)

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    return {
        'id': request_id,
        'status_code': status_code,
        'elapsed_ms': elapsed_ms,
        'error': error,
    }


def run_load_test(total_requests=100, concurrency=10):
    print("=" * 70)
    print(" SLTMOBITEL MI PRODUCT RATES — LOAD & CONCURRENCY BENCHMARK")
    print("=" * 70)
    print(f"Target URL:        {BASE_URL}")
    print(f"Total Requests:    {total_requests}")
    print(f"Concurrent Users:  {concurrency}")
    print("-" * 70)
    print("Executing concurrent requests against Django + Oracle Database...")

    start_wall_time = time.perf_counter()
    results = []

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(make_request, i) for i in range(1, total_requests + 1)]
        for f in as_completed(futures):
            results.append(f.result())

    total_duration = time.perf_counter() - start_wall_time
    latencies = [r['elapsed_ms'] for r in results]
    successes = [r for r in results if r['status_code'] and 200 <= r['status_code'] < 300]
    failures = [r for r in results if not r['status_code'] or r['status_code'] >= 400]

    rps = total_requests / total_duration if total_duration > 0 else 0
    avg_latency = statistics.mean(latencies)
    median_latency = statistics.median(latencies)
    min_latency = min(latencies)
    max_latency = max(latencies)
    p95_latency = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else max_latency
    p99_latency = statistics.quantiles(latencies, n=100)[98] if len(latencies) >= 100 else max_latency

    print("\n" + "=" * 70)
    print(" BENCHMARK RESULTS SUMMARY")
    print("=" * 70)
    print(f"Total Execution Time:   {total_duration:.2f} seconds")
    print(f"Throughput (RPS):       {rps:.2f} requests/sec")
    print(f"Success Count:          {len(successes)} / {total_requests} ({(len(successes)/total_requests)*100:.1f}%)")
    print(f"Failure Count:          {len(failures)} / {total_requests} ({(len(failures)/total_requests)*100:.1f}%)")
    print("-" * 70)
    print(" LATENCY DISTRIBUTION (MILLISECONDS):")
    print(f"  • Minimum Latency:    {min_latency:.2f} ms")
    print(f"  • Average Latency:    {avg_latency:.2f} ms")
    print(f"  • Median Latency:     {median_latency:.2f} ms")
    print(f"  • 95th Percentile:    {p95_latency:.2f} ms")
    print(f"  • 99th Percentile:    {p99_latency:.2f} ms")
    print(f"  • Maximum Latency:    {max_latency:.2f} ms")
    print("=" * 70)

    if len(failures) == 0 and avg_latency < 300:
        print(" VERDICT: PASSED — System easily handles concurrent enterprise throughput!")
    else:
        print(" VERDICT: COMPLETED — Check server logs for failed requests.")


if __name__ == '__main__':
    run_load_test(total_requests=100, concurrency=10)
