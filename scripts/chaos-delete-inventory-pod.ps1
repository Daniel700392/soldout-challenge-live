kubectl delete pod -l app=inventory-service
kubectl get pods -l app=inventory-service -w