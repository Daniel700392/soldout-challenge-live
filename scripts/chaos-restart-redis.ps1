kubectl delete pod -l app=redis
kubectl get pods -l app=redis -w