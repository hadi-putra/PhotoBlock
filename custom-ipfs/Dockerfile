FROM ipfs/go-ipfs:latest

COPY start_ipfs.sh /usr/local/bin/start_ipfs
RUN chown ipfs:users /usr/local/bin/start_ipfs && chmod +x /usr/local/bin/start_ipfs
CMD ["daemon", "--migrate=true"]