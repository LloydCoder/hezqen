# HEZQEN Labs: API vs Self-Hosted AI Cost Break-Even

## Model

The calculator compares monthly token-based API charges with a fixed monthly self-hosted GPU cost.

Let:
- (R) = requests per month
- (I) = input tokens per request
- (O) = output tokens per request
- (P_i) = API input price per million tokens
- (P_o) = API output price per million tokens
- (G) = GPU count
- (C_h) = hourly cost per GPU
- (H) = GPU hours per month
- (X) = additional monthly infrastructure overhead

API cost per request:

`(I × P_i + O × P_o) / 1,000,000`

Monthly API cost:

`R × API cost per request`

Monthly self-hosted cost:

`G × C_h × H + X`

Break-even monthly request volume:

`ceil(self-hosted monthly cost / API cost per request)`

If API cost per request is zero, break-even volume is not reached.

## Assumptions

- Prices are user-supplied USD per million input/output tokens.
- GPU cost is a flat hourly rate for every GPU for the entered number of hours.
- Additional infrastructure overhead is a user-supplied monthly amount.
- The model compares costs only; it does not infer capacity, utilization or performance.

## Exclusions

Engineering labour, on-call coverage, model quality, utilization inefficiency, autoscaling, networking, storage beyond the overhead input, redundancy, taxes, discounts, minimum commitments and workload-specific throughput constraints are excluded. GPU capacity must be independently validated.

The calculator is a planning aid, not a procurement recommendation or vendor quote.
